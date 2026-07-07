export class MessageParams {
    public uuid?: string;
    public replayIdMessage?: string;
    public idChat?: string;
    public idUserSender?: string;
    public mediaDataProfileSender?: string;
    public idMediaDataProfileSender?: string;
    public idUserReceiver?: string;
    public mediaDataProfileReceiver?: string;
    public idMediaDataProfileReceiver?: string;
    public messageValue?: string;
    public usernameReceiver?: string;
    public verifyUserReceiver?: number;
    public verifyTypeUserReceiver?: string | undefined;
    public usernameSender?: string;
    public verifyUserSender?: number;
    public verifyTypeUserSender?: string | undefined;
    public nameReceiver?: string;
    public nameSender?: string;
    public nameGroup?: string;
    public type?: string;
    public status?: number;
    public idMedia?: string;
    public mediaData?: string;
    public conversationType?: string;
    public createDate?: string;
}
