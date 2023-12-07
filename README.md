# IC Angular

## Example

An example project is available in the [example](./example/README.md) folder.

## Contributing

### Setup

Add the following to `~/.bashrc`:

```bash
# fnm
export PATH="~/.fnm:$PATH"
eval "$(fnm env --use-on-cd)"
```

Run the system setup script.

_WARNING!_ This script will install software on your system, please review it before running it. Most notably, it will reinstall DFX and wipe out any local state that you have. Follow the steps manually if you don't want to lose state:

```bash
./scripts/system-setup.sh
```

Enable `.bashrc` changes in your current shell:

```bash
source ~/.bashrc
```

Activate PNPM:

```bash
corepack enable
```

Install dependencies:

```bash
pnpm i
```
