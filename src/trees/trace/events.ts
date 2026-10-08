import { NodeId } from '../core/types';

export type TraceEventType =
    | 'start'
    | 'visit'
    | 'compare'
    | 'insert'
    | 'delete'
    | 'found'
    | 'not_found'
    | 'rotate'
    | 'imbalance'
    | 'end';

export interface TraceEvent {
    type: TraceEventType;
    nodeId?: NodeId;
    value?: number;
    comparedValue?: number;
    message: string;
    stateSnapshot?: any;
}

export class TraceBuilder {
    private events: TraceEvent[] = [];

    addEvent(event: TraceEvent) {
        this.events.push(event);
    }

    getEvents() {
        return this.events;
    }
}
