const crypto = require('crypto');

/**
 * 计算消息签名接口
 */
module.exports = class SHA1 {
  /**
   * 用SHA1算法生成安全签名
   *
   * @param token 票据
   * @param timestamp 时间戳
   * @param nonce 随机字符串
   * @param encrypt 密文
   *
   *@return 安全签名
   */
  static getSHA1(token, timestamp, nonce, encrypt) {
    // 字符串排序
    const array = [token, timestamp, nonce, encrypt].sort();
    let str = '';
    for (let i = 0; i < array.length; i += 1) {
      str += array[i];
    }

    // SHA1签名生成
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);
    const digest = sha1.digest();

    let hexstr = '';
    for (let i = 0; i < digest.length; i += 1) {
      const shaHex = (digest[i] & 0xFF).toString(16);
      if (shaHex.length < 2) {
        hexstr += '0';
      }

      hexstr += shaHex;
    }

    return hexstr;
  }
};
