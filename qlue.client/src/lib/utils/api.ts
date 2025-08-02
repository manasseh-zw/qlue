export type ApiResponse<T = null> =
	| {
			data: T;
			success: true;
	  }
	| {
			success: false;
			errors: string[];
	  }; 