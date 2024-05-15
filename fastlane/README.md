fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios build

```sh
[bundle exec] fastlane ios build
```

Build dev IPA

### ios publish

```sh
[bundle exec] fastlane ios publish
```

Build and upload 1 IPA to App Center

### ios release_all

```sh
[bundle exec] fastlane ios release_all
```

Build and upload ipas for all environments

----


## Android

### android build

```sh
[bundle exec] fastlane android build
```

Build dev apk

### android publish

```sh
[bundle exec] fastlane android publish
```

Build and upload to App Center.

### android release_all

```sh
[bundle exec] fastlane android release_all
```

Build and upload ipas for all environments

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
