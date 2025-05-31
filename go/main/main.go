package main

import (
	"github.com/extism/go-pdk"

	bus "github.com/autonomouskoi/core-tinygo"
	overlay "github.com/autonomouskoi/trackstar-overlay/go"
)

var (
	topic_overlay_request = overlay.BusTopic_TRACKSTAR_OVERLAY_EVENT.String()

	o *overlay.Overlay
)

//go:export start
func Initialize() int32 {
	bus.LogDebug("starting up")

	var err error
	o, err = overlay.New()
	if err != nil {
		bus.LogError("loading config", "error", err.Error())
		return -1
	}

	return 0
}

//go:export recv
func Recv() int32 {
	msg := &bus.BusMessage{}
	if err := msg.UnmarshalVT(pdk.Input()); err != nil {
		bus.LogError("unmarshalling message", "error", err.Error())
		return 0
	}
	o.Handle(msg)
	return 0
}

func main() {}
