import encryption from '@adonisjs/core/services/encryption'

export default class SecretCipher {
  static encrypt(value: string) {
    return encryption.encrypt(value)
  }

  static decrypt(value: string) {
    return encryption.decrypt<string>(value)
  }
}
