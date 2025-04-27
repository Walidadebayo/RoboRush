import { MappifyModel } from 'mappifysql';

export interface ScoreAttributes {
    id?: number;
    name: string;
    time: number;
    score: number;
    attempts: number;
    created_at?: Date;
    updated_at?: Date;
}

class Score extends MappifyModel implements ScoreAttributes {
    id?: number | undefined;
    name: string;
    time: number;
    score: number;
    attempts: number;
    created_at?: Date | undefined;

    updated_at?: Date | undefined;
    static get tableName() {
        return 'scores';
    }
    constructor(attributes: ScoreAttributes) {
        super();
        this.id = attributes.id;
        this.name = attributes.name;
        this.time = attributes.time;
        this.score = attributes.score;
        this.attempts = attributes.attempts;
        this.created_at = attributes.created_at || new Date();
        this.updated_at = attributes.updated_at || new Date();
    }
}

export default Score;