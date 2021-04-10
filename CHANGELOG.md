# Changelog
All notable changes to the micro-web-service project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[comment]: <> (## [Unreleased])
## [4.1.0] - 2021-04-11
### Added
- 'patch' to allowed HTTP methods.

## [4.0.0] - 2021-04-11
### BREAKING CHANGES
- The exported `Request` type is now a custom type using `Params`, `Unsure` from this package and `Query` from express.
  This type is more type-safe than the `Request` exported by express.

### Added
- `ValidationRoute` for easy ajv validation setup.
- `Unsure` type, an interface that sets all properties to `unknown`.
- `Params` type, a more type-safe version of express' `ParamsDictionary`.

## [3.0.2] - 2021-04-06
### Fixed
- Request logger losing class context while logging.

## [3.0.1] - 2021-04-01
### Changed
- Build target is now es2017 (compatible with Node.js 10 and up).

## [3.0.0] - 2021-03-31
### BREAKING CHANGES
- RequestLogger changes:
    - Now needs to be instantiated before use.
    - `RequestLogger.logRequest()` becomes `new RequestLogger().getLogger()`
- Moved `chalk` from peerDependencies to dependencies.
- Moved `http-status-codes` from peerDependencies to dependencies.
- Moved `debug` from peerDependencies to optionalDependencies.
- Moved `supports-color` from peerDependencies to optionalDependencies.

### Added
- `ServiceController.getStandardMiddleware` function to fetch the default middleware (excluding the logger).

### Changed
- Improved route creation logging.
- Made debug package integration optional.

## [2.0.0] - 2020-11-26
### BREAKING CHANGES
- Renamed `sendSuccessResponse` to `sendSuccess`.
- Renamed `send404` to `sendNotFound`.

### Added
- Support for Node.js 14.
- Helper functions for sending 200, 400, 404 and 405 responses.
- `IServerResponse` to exports.
- Utility functions for gracefully shutting down a server 

## [1.0.0] - 2020-06-19
### Added
- Initial code.
- Setup for this project.

[Unreleased]: https://github.com/Ionaru/micro-web-service/compare/4.1.0...HEAD
[4.1.0]: https://github.com/Ionaru/micro-web-service/compare/4.0.0...4.1.0
[4.0.0]: https://github.com/Ionaru/micro-web-service/compare/3.0.2...4.0.0
[3.0.2]: https://github.com/Ionaru/micro-web-service/compare/3.0.1...3.0.2
[3.0.1]: https://github.com/Ionaru/micro-web-service/compare/3.0.0...3.0.1
[3.0.0]: https://github.com/Ionaru/micro-web-service/compare/2.0.0...3.0.0
[2.0.0]: https://github.com/Ionaru/micro-web-service/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/Ionaru/micro-web-service/compare/3b5e936...1.0.0
