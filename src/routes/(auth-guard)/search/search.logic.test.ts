import { describe, expect, it, mock } from "bun:test";
import { runSearchQuery } from "./search.logic";

describe("runSearchQuery", () => {
	it("does not call the backend for queries shorter than 3 characters", async () => {
		const execute = mock(async () => ({ total_results: 0, results: [] }));

		const result = await runSearchQuery({
			query: " ab ",
			language: "en-US",
			execute,
		});

		expect(result).toBeNull();
		expect(execute).not.toHaveBeenCalled();
	});

	it("normalizes valid queries and sends page 1 to the backend", async () => {
		const response = { total_results: 1, results: [{ id: 1 }] };
		const execute = mock(async () => response);

		const result = await runSearchQuery({
			query: "  alien  ",
			language: "en-US",
			execute,
		});

		expect(result).toBe(response);
		expect(execute).toHaveBeenCalledTimes(1);
		expect(execute).toHaveBeenCalledWith({
			query: "alien",
			language: "en-US",
			page: 1,
		});
	});
});
