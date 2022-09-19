package app

import (
	"github.com/abdfnx/botway/constants"
	"github.com/abdfnx/botway/internal/pipes/initx"
	"github.com/abdfnx/botway/tools"
	"github.com/spf13/cobra"
)

func DockerInitCMD() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "docker-init",
		Short: "Initialize ~/.botway for docker containers",
		Run: func(cmd *cobra.Command, args []string) {
			if opts.CopyFile {
				tools.Copy("botway.json", constants.BotwayDirPath)
			} else {
				initx.DockerInit()
			}
		},
	}

	cmd.Flags().BoolVarP(&opts.CopyFile, "copy-file", "", false, "Copy config file")

	return cmd
}