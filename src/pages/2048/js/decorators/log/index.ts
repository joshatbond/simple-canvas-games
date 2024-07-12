import { LoggerFactory } from './factory'

const logger = LoggerFactory.getInstance()

export function log() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const targetMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      logger.log(`${target.constructor.name}.${propertyKey}(${args})`)
      return targetMethod.apply(this, args)
    }

    return descriptor
  }
}
