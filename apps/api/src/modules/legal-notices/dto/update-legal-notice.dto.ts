import { PartialType } from "@nestjs/swagger";
import { CreateLegalNoticeDto } from "./create-legal-notice.dto";

export class UpdateLegalNoticeDto extends PartialType(CreateLegalNoticeDto) {}
