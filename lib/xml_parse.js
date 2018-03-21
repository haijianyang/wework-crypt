const xml2js = require('xml2js');

/**
 * 提供提取消息格式中的密文及生成回复消息格式的接口
 */
module.exports = class XMLParse {
  /**
   * 生成xml消息
   * @param encrypt 加密后的消息密文
   * @param signature 安全签名
   * @param timestamp 时间戳
   * @param nonce 随机字符串
   *
   * @return 生成的xml字符串
   */
  static generate(encrypt, signature, timestamp, nonce) {
    return (`
      <xml>\n
        <Encrypt><![CDATA[${encrypt}]]></Encrypt>\n
        <MsgSignature><![CDATA[${signature}]]></MsgSignature>\n
        <TimeStamp>${timestamp}</TimeStamp>\n
        <Nonce><![CDATA[${nonce}]]></Nonce>\n
      </xml>
    `);
  }

  /**
   * 提取出xml数据包中的加密消息
   *
   * @param xmlText 待提取的xml字符串
   *
   * @return 提取出的加密消息字符串
   */
  static extract(xmlText) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlText, { async: true, trim: true }, (err, obj) => {
        if (err) {
          return reject(err);
        }

        return resolve(obj.xml);
      });
    });
  }
};
