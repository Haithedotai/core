import { Axios } from "axios";

export class TelegramBot {
	private rpc: Axios;

	constructor(
		public botToken: string,
		public chatId: number,
	) {
		this.rpc = new Axios({
			baseURL: `https://api.telegram.org/bot${botToken}/`,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	async sendMessage(options: { message: string }) {
		const { message } = options;
		const response = await this.rpc.post("sendMessage", {
			chat_id: this.chatId,
			text: message,
		});

		return response;
	}
}
