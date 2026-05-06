{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    systems.url = "github:nix-systems/default";
    flake-parts.url = "github:hercules-ci/flake-parts";
    services-flake.url = "github:juspay/services-flake";
  };

  outputs = inputs @ {
    self,
    systems,
    nixpkgs,
    flake-parts,
    ...
  }:
    flake-parts.lib.mkFlake {inherit inputs;} (top: {
      imports = [
        inputs.treefmt-nix.flakeModule
      ];
      systems = import systems;
      perSystem = {
        pkgs,
        lib,
        ...
      }: {
        devShells = {
          default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              nodejs
              nodePackages.pnpm
              typescript-language-server
              docker
              # docker-compose
            ];
          };
        };

        # ── Treefmt ──────────────────────────────────────────────────
        treefmt = {
          projectRootFile = "flake.nix";
          programs = {
            nixfmt.enable = true;
          };
          settings.formatter = {};
        };
      };
    });
}
