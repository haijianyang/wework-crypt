/**
 * 提供基于PKCS7算法的加解密接口
 */
class PKCS7Encoder {
  /**
   * 获得对明文进行补位填充的字节
   *
   * @param count 需要进行填充补位操作的明文字节个数
   * @return 补齐用的字节数组
   */
  static encode(count) {
    // 计算需要填充的位数
    let amountToPad = PKCS7Encoder.BLOCK_SIZE - (count % PKCS7Encoder.BLOCK_SIZE);
    if (amountToPad === 0) {
      amountToPad = PKCS7Encoder.BLOCK_SIZE;
    }

    // 获得补位所用的字符
    const padChr = PKCS7Encoder.chr(amountToPad);
    let tmp = '';
    for (let i = 0; i < amountToPad; i += 1) {
      tmp += padChr;
    }

    return Buffer.from(tmp);
  }

  /**
   * 删除解密后明文的补位字符
   *
   * @param decrypted 解密后的明文
   * @return 删除补位字符后的明文
   */
  static decode(decrypted) {
    let pad = parseInt(decrypted[decrypted.length - 1], 10);
    if (pad < 1 || pad > 32) {
      pad = 0;
    }

    return decrypted.slice(0, decrypted.length - pad);
  }

  /**
   * 将数字转化成ASCII码对应的字符，用于对明文进行补码
   *
   * @param a 需要转化的数字
   * @return 转化得到的字符
   */
  static chr(c) {
    return String.fromCharCode(c & 0xFF);
  }
}
PKCS7Encoder.BLOCK_SIZE = 32;

module.exports = PKCS7Encoder;
