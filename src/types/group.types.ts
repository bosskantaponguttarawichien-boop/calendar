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
    category: string;
    image?: string;
    icon?: string;
    members: GroupMember[];
    memberIds: string[];
    creatorId: string;
    lastMsg?: string;
    time?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
