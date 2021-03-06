"use strict";

describe("OaepTest", function () {

    var assert = chai.assert;


    it("_i2osp ", function () {
        var a = new tutao.crypto.Oaep();
        var i = parseInt("44332211", 16);
        var bytes = a._i2osp(i);
        assert.deepEqual(bytes, [68, 51, 34, 17 ]);
    });

    it("_mgf1 ", function () {
        var a = new tutao.crypto.Oaep();
        var bytes = [1, 2, 3, 4];
        assert.equal(sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(a._mgf1(bytes, 32))), "e25f9f0a2c2664632d1be5e2f25b2794c371091b61eb762ad98861da3a2221ee");
        assert.equal(sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(a._mgf1(bytes, 63))), "e25f9f0a2c2664632d1be5e2f25b2794c371091b61eb762ad98861da3a2221ee366dcb38806a930d052d8b7bac72a4e59bbe8a78792b4d975ed944dc0f64f6");
        assert.equal(sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(a._mgf1(bytes, 64))), "e25f9f0a2c2664632d1be5e2f25b2794c371091b61eb762ad98861da3a2221ee366dcb38806a930d052d8b7bac72a4e59bbe8a78792b4d975ed944dc0f64f6e5");
        assert.equal(sjcl.codec.hex.fromBits(sjcl.codec.bytes.toBits(a._mgf1(bytes, 65))), "e25f9f0a2c2664632d1be5e2f25b2794c371091b61eb762ad98861da3a2221ee366dcb38806a930d052d8b7bac72a4e59bbe8a78792b4d975ed944dc0f64f6e5c3");
    });

    it("_getPSBlock ", function () {
        var a = new tutao.crypto.Oaep();
        assert.deepEqual(a._getPSBlock([10, 20, 30], 80), [0, 0, 0, 0, 0, 1, 10, 20, 30]);
    });

    it("pad ", function () {
        var a = new tutao.crypto.Oaep();
        var value = [1, 2, 3, 4];
        // random seed and resulting block taken from Java reference test debugging
        var seed = [105, 117, -108, -12, 80, 20, -84, -108, 113, 44, 74, 19, -126, -110, -84, 124, 58, 108, 86, 28, 5, -3, -65, -76, 80, -4, -66, 12, -14, -33, -84, 13];
        var block = [95, -18, 112, -22, -48, -67, 43, 71, -43, 99, -112, 5, -36, 1, 120, -109, -119, -91, 113, 112, -42, -22, -31, 31, -17, 47, 32, -2, -112, -62, -53, 51, 98, 99, -58, 62, 91, -24, 35, -37, 53, 66, -18, -68, -39, -38, 91, -124, -27, 68, -10, 39, 40, -45, 87, -64, -90, 58, -3, -39, 1, 89, -75, -88, 121, -72, 40, -14, 88, 107, 7, -117, 70, 46, -7, -49, -117, 36, 98, 39, -128, 79, -63, -94, -81, -57, -71, -43, -13, 10, -69, -54, -99, 2, 21, -49, 89, 84, 111, -121, 108, 23, -107, 55, -6, 62, -86, 74, 6, 9, 58, -71, 11, 96, -115, 120, -83, 30, -63, -125, 29, 67, -80, 15, 62, -111, -40, -6, 32, 72, -5, -113, -66, -33, -91, -47, -42, -104, -61, 107, -53, 105, 78, 96, 100, 61, -94, -28, -38, -87, -44, -125, 29, 85, -108, 93, 121, -83, 63, 16, 9, -10, 123, 86, -89, -42, 30, -51, -44, 30, -46, -84, 6, -87, -83, -117, -100, -10, 99, -53, -86, -38, -70, -116, 98, -57, -101, 60, 67, 27, -81, 99, -44, 74, -74, -29, 85, 78, -17, -74, 76, 47, 97, 120, -40, 91, 91, -57, 35, -84, 28, -68, 80, 90, -91, 95, 24, -69, 96, -107, -31, -100, -33, 54, -39, -118, -28, -23, -31, -80, -30, 94, -13, 26, 56, 41, -32, 50, 14, 63, -119, -105, 106, -99, 1, -35, -43, 82, 68, -4, -94, 46, 36, -33, 67];
        // convert unsigned bytes from Java to numbers
        for (var i = 0; i < seed.length; i++) {
            if (seed[i] < 0) {
                seed[i] = 256 + seed[i];
            }
        }
        for (var i = 0; i < block.length; i++) {
            if (block[i] < 0) {
                block[i] = 256 + block[i];
            }
        }
        var padded = a.pad(value, 2048, seed);
        assert.deepEqual(padded, block);
    });

    it("unpad ", function () {
        var a = new tutao.crypto.Oaep();
        var value = [1, 2, 3, 4];
        // random seed and resulting block taken from Java reference test debugging
        var seed = [105, 117, -108, -12, 80, 20, -84, -108, 113, 44, 74, 19, -126, -110, -84, 124, 58, 108, 86, 28, 5, -3, -65, -76, 80, -4, -66, 12, -14, -33, -84, 13];
        // convert unsigned bytes from Java to numbers
        for (var i = 0; i < seed.length; i++) {
            if (seed[i] < 0) {
                seed[i] = 256 + seed[i];
            }
        }
        var padded = a.pad(value, 2048, seed);
        var unpadded = a.unpad(padded, 2048);
        assert.deepEqual(unpadded, value);
    });

    it("oaep roundtrip", function () {
        var a = new tutao.crypto.Oaep();
        var value = [136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136, 136];
        // random seed and resulting block taken from Java reference test debugging
        var seed = [162, 95, 112, 193, 175, 43, 224, 109, 31, 237, 128, 19, 223, 62, 165, 214, 25, 80, 79, 196, 236, 13, 67, 226, 44, 159, 220, 200, 189, 183, 227, 113];
        var padded = a.pad(value, 2048, seed);
        var unpadded = a.unpad(padded, 2048);
        assert.deepEqual(unpadded, value);
        var p = [180, 22, 97, 228, 208, 26, 91, 10, 207, 147, 121, 122, 130, 96, 157, 254, 150, 226, 165, 62, 16, 124, 51, 100, 16, 146, 58, 29, 31, 97, 204, 233, 203, 28, 3, 250, 142, 110, 235, 134, 227, 212, 73, 207, 209, 211, 62, 77, 139, 49, 42, 140, 226, 105, 160, 75, 11, 134, 165, 182, 105, 111, 37, 192, 213, 82, 80, 148, 140, 105, 232, 74, 20, 76, 4, 49, 208, 147, 230, 87, 215, 173, 200, 84, 202, 231, 3, 175, 159, 60, 125, 39, 145, 98, 71, 229, 210, 214, 228, 234, 218, 75, 168, 117, 151, 224, 137, 96, 116, 220, 158, 184, 22, 226, 121, 94, 169, 98, 227, 73, 241, 84, 80, 130, 146, 245, 25, 66, 84, 25, 36, 248, 24, 196, 250, 56, 165, 76, 199, 62, 50, 228, 146, 58, 174, 190, 213, 121, 124, 129, 69, 164, 38, 115, 9, 103, 213, 84, 242, 145, 72, 26, 91, 10, 189, 149, 169, 188, 174, 126, 98, 127, 238, 120, 204, 123, 145, 245, 60, 6, 122, 188, 79, 154, 6, 79, 221, 156, 245, 64, 115, 91, 168, 70, 110, 112, 224, 56, 39, 128, 234, 158, 210, 123, 240, 232, 140, 85, 104, 39, 238, 109, 75, 99, 98, 200, 252, 41, 151, 133, 37, 127, 19, 24, 18, 249, 110, 112, 146, 187, 127, 80, 252, 76, 246, 206, 25, 149, 207, 63, 155, 65, 180, 44, 2, 12, 102, 236, 24, 241, 231, 68, 148, 251, 204];
    });


});