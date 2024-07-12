class ConsoleLogger {
  log(message: string) {
    console.log(message)
  }
}

let logger: ConsoleLogger | null = null

export class LoggerFactory {
  public static getInstance() {
    if (!logger) logger = new ConsoleLogger()

    return logger
  }
}
