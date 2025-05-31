package overlay

import (
	"errors"
	"fmt"

	"github.com/autonomouskoi/akcore"
	bus "github.com/autonomouskoi/core-tinygo"
)

var (
	topic_event   = BusTopic_TRACKSTAR_OVERLAY_EVENT.String()
	topic_request = BusTopic_TRACKSTAR_OVERLAY_REQUEST.String()
	topic_command = BusTopic_TRACKSTAR_OVERLAY_COMMAND.String()

	cfgKVKey = []byte("config")
)

type Overlay struct {
	cfg    *Config
	router bus.TopicRouter
}

func New() (*Overlay, error) {
	for _, topic := range []string{topic_request, topic_command} {
		bus.LogDebug("subscribing", "topic", topic)
		if err := bus.Subscribe(topic); err != nil {
			return nil, fmt.Errorf("subscribing to %s", topic)
		}
		bus.LogDebug("subscribed", "topic", topic)
	}

	o := &Overlay{
		cfg: &Config{},
	}
	if err := o.loadCfg(); err != nil && !errors.Is(err, akcore.ErrNotFound) {
		return nil, fmt.Errorf("loading config: %w", err)
	}
	o.router = bus.TopicRouter{
		topic_request: bus.TypeRouter{
			int32(MessageTypeRequest_CONFIG_GET_REQ): o.handleRequestGetConfig,
		},
		topic_command: bus.TypeRouter{
			int32(MessageTypeCommand_CONFIG_SET_REQ): o.handleCommandSetConfig,
		},
	}
	return o, nil
}

func (o *Overlay) loadCfg() error {
	return bus.KVGetProto(cfgKVKey, o.cfg)
}

func (o *Overlay) Handle(msg *bus.BusMessage) {
	o.router.Handle(msg)
}

func (o *Overlay) handleRequestGetConfig(msg *bus.BusMessage) *bus.BusMessage {
	reply := bus.DefaultReply(msg)
	bus.MarshalMessage(reply, &ConfigGetResponse{Config: o.cfg})
	return reply
}

func (o *Overlay) handleCommandSetConfig(msg *bus.BusMessage) *bus.BusMessage {
	reply := bus.DefaultReply(msg)
	req := ConfigSetRequest{}
	if reply.Error = bus.UnmarshalMessage(msg, &req); reply.Error != nil {
		return reply
	}

	if err := bus.KVSetProto(cfgKVKey, req.GetConfig()); err != nil {
		errStr := err.Error()
		bus.LogError("saving config", "error", errStr)
		reply.Error = &bus.Error{
			UserMessage: &errStr,
		}
		return reply
	}
	o.cfg = req.GetConfig()
	bus.MarshalMessage(reply, &ConfigSetResponse{Config: o.cfg})
	updateMessage := &bus.BusMessage{
		Topic: topic_event,
		Type:  int32(MessageTypeEvent_CONFIG_UPDATED),
	}
	if bus.MarshalMessage(updateMessage, &ConfigUpdatedEvent{Config: o.cfg}); updateMessage.Error == nil {
		bus.Send(updateMessage)
	}
	return reply
}
