const { google } = require("googleapis");
const fetch = require('node-fetch'); // Import fetch for making HTTP requests
require('dotenv').config();
const { Readable } = require('stream');
const { createFileInfo, deleteFileInfo, getFileVotesStatus } = require("./rating")

class FileManager {
  constructor() {
    this.jwtClient = new google.auth.JWT(
      process.env.CLIENT_EMAIL,
      null,
      process.env.PRIVATE_KEY,
      ['https://www.googleapis.com/auth/drive'],
      null
    );
    this.expiryTime = null;
    this.authorized = false;
    this.PARENT = process.env.PARENT;
    this.SCHEDULE = process.env.SCHEDULE;
    this.ACADEMICS = process.env.ACADEMICS;
    this.FACULTYID = process.env.FACULTY;
  }

  getPARENT() {
    return this.PARENT;
  }
  static getInstance() {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  async authorize() {
    if (!this.authorized || Date.now() >= this.expiryTime) {
      await this.jwtClient.authorize();
      this.expiryTime = Date.now() + 3600 * 1000; // Set expiry time to 1 hour from now
      this.authorized = true;
    }
  }

  async getSemList(parentID = this.ACADEMICS) {
    await this.authorize();
    const service = google.drive("v3");
    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 900,
      q: `'${parentID}' in parents`,
      fields: 'files(id, name)'
    });
    response.data.files.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return response.data.files;
  }


  async getSubList(semName) {
    await this.authorize();
    const service = google.drive("v3");
    const semID = await this.getIDByName(this.ACADEMICS, semName);
    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 900,
      q: `'${semID}' in parents`,
      fields: 'files(id, name)'
    });
    response.data.files.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return response.data.files;
  }

  async getFiles(parentID, userId) {
    await this.authorize();
    const service = google.drive("v3");
    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 900,
      q: `'${parentID}' in parents`,
      fields: 'files(id, name, originalFilename, properties, description, thumbnailLink)'
    });

    for (let index = 0; index < (response.data.files).length; index++) {
      if (response.data.files[index].thumbnailLink) {
        const responseThumbnail = await fetch(response.data.files[index].thumbnailLink);
        const buffer = await responseThumbnail.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const base64String = Buffer.from(bytes).toString('base64');
        response.data.files[index].thumbnailLink = `data:image/png;base64,${base64String}`;
      }
      const { upvotesCount, downvotesCount, userStatus } = await getFileVotesStatus(response.data.files[index].id, userId);
      response.data.files[index].upvotesCount = upvotesCount;
      response.data.files[index].downvotesCount = downvotesCount;
      response.data.files[index].userStatus = userStatus;
    }

    response.data.files.sort((a, b) => {
      const diffA = a.upvotesCount - a.downvotesCount;
      const diffB = b.upvotesCount - b.downvotesCount;
      if (diffA === diffB) {
        // If the difference is the same, sort alphabetically by title
        return a.name.localeCompare(b.name);
      }
      // Otherwise, sort by the difference
      return diffB - diffA;
    });

    return response.data.files;
  }

  async getPYQs(semName, userId) {
    const semID = await this.getIDByName(this.ACADEMICS, semName);
    const directoryId = await this.getIDByName(semID, 'Previous Year Exams')
    return await this.getFiles(directoryId, userId);
  }

  async getSubjectFiles(subID, type, userId) {
    const directoryId = await this.getIDByName(subID, type)
    return await this.getFiles(directoryId, userId);
  }


  async downloadFileStream(fileID, res) {
    await this.authorize();
    const service = google.drive("v3");
    const response = await service.files.get(
      { fileId: fileID, alt: 'media', auth: this.jwtClient },
      { responseType: 'stream' } // Request response as a stream
    );

    // Set response headers
    res.setHeader('Content-Type', response.headers['content-type']);
    // Check if the 'content-length' header is present before setting it
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    // Pipe the file stream to the response
    response.data.pipe(res); // Stream the file to the client
  }


  async listFolders(rootId = this.ACADEMICS, level = 0) {
    if (level > 1) return [];
    await this.authorize();
    const service = google.drive("v3");
    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 50,
      q: `'${rootId}' in parents`,
      fields: 'files(id, name, mimeType)'
    });
    const files = response.data.files;
    const folders = [];
    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        const folder = {
          id: file.id,
          name: file.name,
          children: await this.listFolders(file.id, level + 1)
        };
        folders.push(folder);
      }
    }
    return folders;
  }

  async renameFile(fileId, newName) {
    await this.authorize();
    const service = google.drive("v3");
    const response = await service.files.update({
      auth: this.jwtClient,
      fileId: fileId,
      requestBody: {
        name: newName
      }
    });
    return response.data;
  }

  async deleteFile(fileId) {
    await this.authorize();
    const service = google.drive("v3");
    await service.files.delete({
      auth: this.jwtClient,
      fileId: fileId
    });
    await deleteFileInfo(fileId);
    return "File deleted successfully";
  }

  async createFolder(parentId, folderName) {
    await this.authorize();
    const service = google.drive("v3");
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };
    const response = await service.files.create({
      auth: this.jwtClient,
      resource: fileMetadata,
      fields: 'id'
    });
    return response.data.id;
  }

  async addSubject(parentId, subjectName) {
    const subID = await this.createFolder(parentId, subjectName);
    this.createFolder(subID, "BOOKS");
    this.createFolder(subID, "Notes");
    this.createFolder(subID, "PPT");
    this.createFolder(subID, "Others");
    this.createFolder(subID, "YTPlaylist");
  }

  async getIDByName(parentID, fileName) {
    await this.authorize();
    const service = google.drive("v3");
    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 900,
      q: `'${parentID}' in parents and name = '${fileName}'`,
      fields: 'files(id, name)'
    });
    return response.data.files[0].id;
  }


  async createFile(parentID, body, file) {
    await this.authorize();
    const service = google.drive("v3");
    const fileMetadata = {
      name: body.fileName,
      parents: [parentID],
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      description: body.fileDesc,
      properties: {
        Title: body.fileName,
        fileAuthor: body.fileAuthor,
        fileTopics: body.fileTopics,
      }
    };
    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer)
    };
    const res = await service.files.create({
      auth: this.jwtClient,
      resource: fileMetadata,
      media: media,
      fields: 'id',
      uploadType: 'resumable',
    });
    return res.data.id;
  }

  async createEmptyFile(parentID, body) {
    await this.authorize();
    const service = google.drive("v3");
    const fileMetadata = {
      name: body.fileName,
      parents: [parentID],
      description: body.fileDesc,
      properties: {
        URL: body.fileInput,
        fileAuthor: body.fileAuthor,
        fileTopics: body.fileTopics,
      }
    };
    const res = await service.files.create({
      auth: this.jwtClient,
      resource: fileMetadata,
      fields: 'id',
      uploadType: 'resumable',
    });
    return res.data.id;
  }

  async uploadTimetable(body, file) {
    if (!file.mimetype.startsWith('image/')) {
      throw new TypeError("Upload Image File Only.")
    }
    await this.authorize();
    const service = google.drive("v3");
    const fileMetadata = {
      name: body.fileName,
      parents: [this.SCHEDULE],
      mimeType: file.mimetype
    };
    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer)
    };
    const res = await service.files.create({
      auth: this.jwtClient,
      resource: fileMetadata,
      media: media,
      fields: 'id',
      uploadType: 'resumable',
    });
    return res.data.id;
  }

  async uploadFaculty(body, file) {
    if (!file.mimetype.startsWith('image/')) {
      throw new TypeError("Upload Image File Only.")
    }
    await this.authorize();
    const service = google.drive("v3");
    const fileMetadata = {
      name: body.facultyEmail,
      parents: [this.FACULTYID],
      properties: {
        facultyProfile: body.facultyProfile,
        facultyRole: body.facultyRole,
        facultyName: body.facultyName,
        facultyContact: body.facultyContact,
      },
      mimeType: file.mimetype
    };
    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer)
    };
    const res = await service.files.create({
      auth: this.jwtClient,
      resource: fileMetadata,
      media: media,
      fields: 'id',
      uploadType: 'resumable',
    });
    return res.data.id;
  }

  async uploadToDrive(body, file) {
    if (body.typeSelect == 'BOOKS' || body.typeSelect == 'Notes' || body.typeSelect == 'PPT') {
      const directoryId = await this.getIDByName(body.subjectSelect, body.typeSelect);
      const fileId = await this.createFile(directoryId, body, file);
      await createFileInfo(fileId);
      return fileId;
    } else if (body.typeSelect == 'PYQs') {
      const fileId = await this.createFile(body.subjectSelect, body, file);
      await createFileInfo(fileId);
      return fileId;
    }
    else {
      const directoryId = await this.getIDByName(body.subjectSelect, body.typeSelect);
      const fileId = await this.createEmptyFile(directoryId, body);
      await createFileInfo(fileId);
      return fileId;
    }
  }

  async getListFilesMetadata(body) {
    await this.authorize();
    const service = google.drive("v3");
    let parentID = "";
    if (body.type == 'PYQs') {
      parentID = body.subject;
    } else {
      parentID = await this.getIDByName(body.subject, body.type);
    }
    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 900,
      q: `'${parentID}' in parents`,
      fields: 'files(id, name, properties, description)'
    });
    return response.data.files;
  }

  async listSchedule() {
    await this.authorize();
    const service = google.drive("v3");
    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 900,
      q: `'${this.SCHEDULE}' in parents`,
      fields: 'files(id, name, properties)'
    });
    return response.data.files;
  }

  async listFaculty() {
    await this.authorize();
    const service = google.drive("v3");
    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 900,
      q: `'${this.FACULTYID}' in parents`,
      fields: 'files(id, name, properties)'
    });

    // Sort faculty by role priority and then alphabetically within each role
    const roleOrder = [
      'associate professor & hod it',
      'assistant professor (grade-i)',
      'assistant professor (grade-ii)'
    ];

    response.data.files.sort((a, b) => {
      const roleA = a.properties?.facultyRole || '';
      const roleB = b.properties?.facultyRole || '';

      const indexA = roleOrder.indexOf(roleA.toLowerCase());
      const indexB = roleOrder.indexOf(roleB.toLowerCase());

      // If both roles are found in the order list, compare their indices
      if (indexA !== -1 && indexB !== -1) {
        // If they have the same role, sort alphabetically by faculty name
        if (indexA === indexB) {
          const nameA = a.properties?.facultyName || a.name || '';
          const nameB = b.properties?.facultyName || b.name || '';
          return nameA.localeCompare(nameB);
        }
        return indexA - indexB;
      }

      // If only one role is found in the order list, it should come first
      if (indexA !== -1) {
        return -1;
      }
      if (indexB !== -1) {
        return 1;
      }

      // If neither role is found in the order list, sort by name
      const nameA = a.properties?.facultyName || a.name || '';
      const nameB = b.properties?.facultyName || b.name || '';
      return nameA.localeCompare(nameB);
    });

    return response.data.files;
  }

  async getScheduleOrFaculty(type) {
    await this.authorize();
    const service = google.drive('v3');
    let parentID = '';
    if (type == 'schedule') {
      parentID = this.SCHEDULE;
    } else if (type == 'faculty') {
      parentID = this.FACULTYID;
    }

    const response = await service.files.list({
      auth: this.jwtClient,
      pageSize: 900,
      q: `'${parentID}' in parents`,
      fields: 'files(id, name, mimeType,properties, thumbnailLink)'
    });

    for (let file of response.data.files) {
      if (file.mimeType.startsWith('image/')) {
        const imageResponse = await service.files.get(
          { fileId: file.id, alt: 'media', auth: this.jwtClient },
          { responseType: 'arraybuffer' }
        );
        const buffer = imageResponse.data;
        const base64String = Buffer.from(new Uint8Array(buffer)).toString('base64');
        file.thumbnailLink = `data:${file.mimeType};base64,${base64String}`;
      }
    }

    if (type === 'faculty') {
      const roleOrder = [
        'associate professor & hod it',
        'assistant professor (grade-i)',
        'assistant professor (grade-ii)'
      ];

      response.data.files.sort((a, b) => {
        const roleA = a.properties?.facultyRole || '';
        const roleB = b.properties?.facultyRole || '';

        const indexA = roleOrder.indexOf(roleA.toLowerCase());
        const indexB = roleOrder.indexOf(roleB.toLowerCase());

        // If both roles are found in the order list, compare their indices
        if (indexA !== -1 && indexB !== -1) {
          // If they have the same role, sort alphabetically by faculty name
          if (indexA === indexB) {
            const nameA = a.properties?.facultyName || a.name || '';
            const nameB = b.properties?.facultyName || b.name || '';
            return nameA.localeCompare(nameB);
          }
          return indexA - indexB;
        }

        // If only one role is found in the order list, it should come first
        if (indexA !== -1) {
          return -1;
        }
        if (indexB !== -1) {
          return 1;
        }

        // If neither role is found in the order list, sort by name
        const nameA = a.properties?.facultyName || a.name || '';
        const nameB = b.properties?.facultyName || b.name || '';
        return nameA.localeCompare(nameB);
      });
    } else {
      response.data.files.sort((a, b) => a.name.localeCompare(b.name));
    }
    return response.data.files;
  }

  async updateFaculty(fileId, body, file) {
    await this.authorize();
    const service = google.drive("v3");

    try {
        console.log('Updating faculty with ID:', fileId);
        console.log('Request body:', body);
        console.log('File present:', !!file);

        // Prepare updated metadata
        const fileMetadata = {
            properties: {
                facultyName: body.facultyName,
                facultyEmail: body.facultyEmail,
                facultyRole: body.facultyRole,
                facultyContact: body.facultyContact,
                facultyProfile: body.facultyProfile || ''
            }
        };

        console.log('File metadata to update:', fileMetadata);

        // If a new file is provided, update the file's media
        let media = null;
        if (file && file.mimetype.startsWith('image/')) {
            media = {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer)
            };
            console.log('Including media in update with mimetype:', file.mimetype);
        }

        // First, get the current file to verify it exists
        try {
            const currentFile = await service.files.get({
                auth: this.jwtClient,
                fileId: fileId,
                fields: 'id, name, properties',
            });
            console.log('Current file data:', currentFile.data);
        } catch (error) {
            console.error('Error retrieving current file:', error);
            throw new Error(`File not found: ${error.message}`);
        }

        // Update the file metadata and/or content
        const res = await service.files.update({
            auth: this.jwtClient,
            fileId: fileId,
            resource: fileMetadata,
            media: media,
            fields: 'id, name, properties, thumbnailLink',
            // Add support for updating thumbnails
            supportsAllDrives: true,
            enforceSingleParent: true
        });

        console.log('File update response:', res.data);

        // If there's a new image, get its thumbnail
        if (file) {
            try {
                const imageResponse = await service.files.get(
                    { fileId: res.data.id, alt: 'media', auth: this.jwtClient },
                    { responseType: 'arraybuffer' }
                );
                const buffer = imageResponse.data;
                const base64String = Buffer.from(new Uint8Array(buffer)).toString('base64');
                res.data.thumbnailLink = `data:${file.mimetype};base64,${base64String}`;
                console.log('Added thumbnail to response');
            } catch (thumbnailError) {
                console.error('Error retrieving thumbnail:', thumbnailError);
                // Continue even if thumbnail retrieval fails
            }
        }
        
        console.log('Returning updated faculty data:', res.data);
        return res.data;
    } catch (error) {
        console.error('Error in updateFaculty:', error);
        throw new Error(`Failed to update faculty: ${error.message}`);
    }
  }

}

module.exports = FileManager;