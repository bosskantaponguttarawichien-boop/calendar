import { EventData } from "./event.types";

export interface GroupMember {
    id: string;
    displayName: string;
    pictureUrl?: string;
    events?: EventData[];
}

export interface Group {
    id: string;
    name: string;
    icon?: string;
    members: GroupMember[];
    lastMsg?: string;
    time?: string;
}
