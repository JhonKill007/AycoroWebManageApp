import { MediaDataParams } from "../MediaData/MediaDataParams";

export type RequestType = "VERIFICATION" | "SERVICE_OWNERSHIP";
export type RequestStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";

export class RequestDocument {
  public documentType:
    | "passport"
    | "id_card"
    | "organization"
    | "business_license"
    | "ownership_proof"
    | "authorization_letter"
    | undefined;
  public side: "single" | "front" | "back" | undefined;
  public mediaData: MediaDataParams | undefined;
  public idMediaData: string | undefined;
  public MediaData: any;
}

export class VerificationData {
  public verifyType: "green" | "blue" | "gold" | undefined;
  public category: string | undefined;
  public identityDocumentType: "passport" | "id_card" | "organization" | undefined;
}

export class ServiceOwnershipData {
  public idItem: string | undefined;
  public itemType: "SERVICE" | undefined;
  public ownershipReason: string | undefined;
  public businessName: string | undefined;
  public contactPhone: string | undefined;
  public contactEmail: string | undefined;
}

export class Request {
  public _id: string | undefined;
  public id: string | undefined;
  public requestType: RequestType | undefined;
  public status: RequestStatus | undefined;
  public idUser: string | undefined;
  public description: string | undefined;
  public documents: RequestDocument[] | undefined;
  public links: string[] | undefined;
  public metadata: VerificationData | ServiceOwnershipData | undefined;
  public createdDate: Date | undefined;
  public User: any;
  public ProfilePhotoUser: string | undefined;
}

export type RequestModel = Request;
