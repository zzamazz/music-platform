import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";

import { CommentDocument } from "./schemas/comment.schema";
import { Track, TrackDocument } from "./schemas/track.schema";
import { Comment } from "./schemas/comment.schema";
import { CreateTrackDTO } from "./dto/create-track.dto";
import { CreateCommentDTO } from "./dto/create-comment.dto";
import { FileService, FileType } from "src/file/file.service";


@Injectable()
export class TrackService {

    constructor(@InjectModel(Track.name) private trackModel: Model<TrackDocument>,
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        private fileService: FileService) { }

    async create(dto: CreateTrackDTO, picture, audio): Promise<Track> {
        const audioPath = this.fileService.createFile(FileType.AUDIO, audio);
        const picturePath = this.fileService.createFile(FileType.IMAGE, picture);
        const track = await this.trackModel.create({ ...dto, listens: 0, audio: audioPath, picture: picturePath });

        return track;
    }

    async getAll(count = 10, offset = 0): Promise<Track[]> {
        const tracks = await this.trackModel.find().skip(offset).limit(count);

        return tracks;
    }


    async getOne(id: ObjectId): Promise<Track> {
        const track = await this.trackModel.findById(id).populate("comments");

        return track;
    }

    async delete(id: ObjectId): Promise<ObjectId> {
        const track = await this.trackModel.findByIdAndDelete(id);

        return track.id;
    }

    async addComment(dto: CreateCommentDTO): Promise<Comment> {
        const track = await this.trackModel.findById(dto.trackId);
        const comment = await this.commentModel.create({ ...dto })
        track.comments.push(comment.id)
        await track.save();

        return comment;
    }

    async listen(id: ObjectId) {
        const track = await this.trackModel.findById(id);
        track.listens++;
        track.save();
    }

    async search(query: string): Promise<Track[]> {
        const tracks = await this.trackModel.find({
            name: { $regex: new RegExp(query, "i") }
        });

        return tracks;
    }
}