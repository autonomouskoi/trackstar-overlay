import { bus, enumName } from '/bus.js';
import * as buspb from '/pb/bus/bus_pb.js';
import * as overlaypb from "/m/trackstar-overlay/pb/overlay_pb.js";
import { ValueUpdater } from '/vu.js';

const TOPIC_EVENT = enumName(overlaypb.BusTopic, overlaypb.BusTopic.TRACKSTAR_OVERLAY_EVENT);
const TOPIC_REQUEST = enumName(overlaypb.BusTopic, overlaypb.BusTopic.TRACKSTAR_OVERLAY_REQUEST);
const TOPIC_COMMAND = enumName(overlaypb.BusTopic, overlaypb.BusTopic.TRACKSTAR_OVERLAY_COMMAND);

class Config extends ValueUpdater<overlaypb.Config> {
    constructor() {
        super(new overlaypb.Config());

        bus.subscribe(TOPIC_EVENT, (msg) => {
            if (msg.type !== overlaypb.MessageTypeEvent.CONFIG_UPDATED) {
                return;
            }
            let cu = overlaypb.ConfigUpdatedEvent.fromBinary(msg.message);
            this.update(cu.config);
        });
    }

    refresh() {
        bus.waitForTopic(TOPIC_REQUEST, 5000)
            .then(() => {
                return bus.sendAnd(new buspb.BusMessage({
                    topic: TOPIC_REQUEST,
                    type: overlaypb.MessageTypeRequest.CONFIG_GET_REQ,
                    message: new overlaypb.ConfigGetRequest().toBinary(),
                }));
            }).then((reply) => {
                let resp = overlaypb.ConfigGetResponse.fromBinary(reply.message);
                this.update(resp.config);
            });
    }

    async save(cfg: overlaypb.Config) {
        return bus.sendAnd(new buspb.BusMessage({
            topic: TOPIC_COMMAND,
            type: overlaypb.MessageTypeCommand.CONFIG_SET_REQ,
            message: new overlaypb.ConfigSetRequest({
                config: cfg,
            }).toBinary(),
        })).then((reply) => {
            let resp = overlaypb.ConfigSetResponse.fromBinary(reply.message);
            this.update(resp.config);
        });
    }
}
export { Config };