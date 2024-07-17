const { getSizeTable } = require("../get-size-table.js");

jest.mock("table-builder");

describe("getSizeTable", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return empty string when rawData is undefined", () => {
    expect(getSizeTable(undefined)).toBe("");
  });

  it("should return a table HTML string when given valid data", () => {
    const Table = require("table-builder");
    Table.mockImplementation(() => ({
      setHeaders: jest.fn().mockReturnThis(),
      setData: jest.fn().mockReturnThis(),
      render: jest.fn().mockReturnValue("<table></table>"),
    }));

    const rawData = {
      S: { 가슴: "100cm", 허리: "80cm" },
      M: { 가슴: "105cm", 허리: "85cm" },
    };

    const result = getSizeTable(rawData);
    expect(result).toBe("<table></table>");
  });

  it("should handle error and return undefined", () => {
    const Table = require("table-builder");
    Table.mockImplementation(() => ({
      setHeaders: jest.fn().mockReturnThis(),
      setData: jest.fn().mockReturnThis(),
      render: jest.fn().mockImplementation(() => {
        throw new Error("Table creation failed");
      }),
    }));

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const rawData = { S: { 가슴: "100cm" } };
    const result = getSizeTable(rawData);

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith("Fail to create Table");
    consoleSpy.mockRestore();
  });
});
