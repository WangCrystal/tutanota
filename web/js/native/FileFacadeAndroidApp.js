"use strict";

tutao.provide('tutao.native.FileFacadeAndroidApp');

/**
 * @implements {tutao.native.FileFacade}
 * @constructor
 */
tutao.native.FileFacadeAndroidApp = function() {
    this.fileUtil = new tutao.native.device.FileUtil();
};

/**
 * @inheritDoc
 */
tutao.native.FileFacadeAndroidApp.prototype.createFile = function(file, sessionKey) {
	// implement together with FileView.
};


/**
 * @inheritDoc
 */
tutao.native.FileFacadeAndroidApp.prototype.showFileChooser = function() {
    var self = this;
    return self.fileUtil.openFileChooser().then(function (uri) {
        return Promise.join(self.fileUtil.getMimeType(uri), self.fileUtil.getSize(uri), function (mimeType, size) {
            return [new tutao.native.AndroidFile(uri, mimeType, size)];
        });
    });
};

/**
 * @inheritDoc
 */
tutao.native.FileFacadeAndroidApp.prototype.uploadFileData = function(/*tutao.native.AndroidFile*/file, sessionKey) {
    tutao.util.Assert.assert(file instanceof tutao.native.AndroidFile, "unsupported file type");
    var self = this;

    var fileData = new tutao.entity.tutanota.FileDataDataPost();
    var byteSessionKey = new Uint8Array(sjcl.codec.bytes.fromBits(sessionKey));
    return tutao.locator.crypto.aesEncryptFile(byteSessionKey, file.getLocation()).then(function (encryptedFileUrl) {
        // create file data
        fileData.setSize(file.getSize())
            .setGroup(tutao.locator.userController.getUserGroupId());

        return fileData.setup({}, null).then(function(fileDataPostReturn) {
            // upload file data
            var fileDataId = fileDataPostReturn.getFileData();
            var putParams = { fileDataId: fileDataId };
            putParams[tutao.rest.ResourceConstants.SW_VERSION_PARAMETER] = tutao.entity.tutanota.FileDataDataReturn.MODEL_VERSION;
            var path = tutao.env.getHttpOrigin() + tutao.rest.EntityRestClient.createUrl(tutao.entity.tutanota.FileDataDataReturn.PATH, null, null, putParams)
            return self.fileUtil.upload(encryptedFileUrl, path, tutao.entity.EntityHelper.createAuthHeaders()).then(function (responseCode) {
                if (responseCode == 200) {
                    return fileDataId;
                } else {
                    throw new tutao.util.ErrorFactory().handleRestError(responseCode, "failed to natively upload attachment");
                }
            });
        }).lastly(function () {
            self.fileUtil.delete(encryptedFileUrl);
        });
    });
};

/**
 * @inheritDoc
 */
tutao.native.FileFacadeAndroidApp.prototype.readFileData = function(file) {
    var self = this;

    var fileParams = new tutao.entity.tutanota.FileDataDataGet()
        .setFile(file.getId())
        .setBase64(tutao.tutanota.util.ClientDetector.getSupportedType() == tutao.tutanota.util.ClientDetector.SUPPORTED_TYPE_LEGACY_IE);
	var params = {};
	params[tutao.rest.ResourceConstants.GET_BODY_PARAM] = encodeURIComponent(JSON.stringify(fileParams.toJsonData()));
	var headers = tutao.entity.EntityHelper.createAuthHeaders();
    var path = tutao.env.getHttpOrigin() + tutao.rest.EntityRestClient.createUrl(tutao.entity.tutanota.FileDataDataReturn.PATH, null, null, params);
    return self.fileUtil.download(path, file.getName(), headers).then(function (downloadedFileUri) {
        var byteSessionKey = new Uint8Array(sjcl.codec.bytes.fromBits(file._entityHelper._sessionKey));
        return tutao.locator.crypto.aesDecryptFile(byteSessionKey, downloadedFileUri).then(function(decryptedFileUri) {
            return new tutao.native.AndroidFile(decryptedFileUri, file.getMimeType(), file.getSize());
        }).lastly(function () {
            self.fileUtil.delete(downloadedFileUri);
        });
    })
};

/**
 * @inheritDoc
 */
tutao.native.FileFacadeAndroidApp.prototype.open = function(file) {
    var self = this;
    self.fileUtil.open(file.getLocation()).lastly(function () {
        self.fileUtil.delete(file.getLocation());
    });
};