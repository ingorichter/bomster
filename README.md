# bomster [![Build Status](https://travis-ci.org/ingorichter/bomster.svg?branch=master)](https://travis-ci.org/ingorichter/bomster)

> Create and verify a BOM for software deliverables

## Install

```
$ npm install -g bomster
```

- [CLI Usage](#cli)

## CLI

```console
$ bomster --help
bomster <command> [options]

Commands:
  create  Create a BOM file
  verify  Verify the contents of the BOM with the directory

Options:
  --help  Show help                                                    [boolean]

2016 - Year of the Monkey

  Examples
	bomster create -d /Applications/TextEdit.app -o textedit-bom.json
	bomster verify -d /Applications/TextEdit.app -i textedit-bom.json
```

## License

MIT © [Ingo Richter](http://www.ingo-richter.name)
