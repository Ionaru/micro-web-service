# Changelog
All notable changes to the micro-web-service project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### BREAKING CHANGES
- Renamed `sendSuccessResponse` to `sendSuccess`.
- Renamed `send404` to `sendNotFound`.

### Added
- Support for Node.js 14.
- Helper functions for sending 200, 400, 404 and 405 responses.
- `IServerResponse` to exports.
- Utility functions for gracefully shutting down a server 

## [1.0.0]
### Added
- Initial code.
- Setup for this project.

[Unreleased]: https://github.com/Ionaru/micro-web-service/compare/1.0.0...HEAD
[1.0.0]: https://github.com/Ionaru/micro-web-service/compare/3b5e936...1.0.0
