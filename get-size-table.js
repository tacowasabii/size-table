const Table = require("table-builder");

const SIZE_TABLE_HEADER = "라벨 사이즈";
const parseHeaders = (data) => {
  const firstRow = Object.values(data)[0];

  return Object.keys(firstRow).reduce(
    (acc, key, index) => ({ ...acc, [index + 1]: key }),
    { 0: SIZE_TABLE_HEADER },
  );
};

const parseData = (headers, data) =>
  Object.entries(data).map(([size, measurements]) =>
    Object.entries(headers).reduce(
      (acc, [headerKey, headerValue]) => ({
        ...acc,
        [headerKey]:
          headerValue === SIZE_TABLE_HEADER ? size : measurements[headerValue],
      }),
      {},
    ),
  );

const getSizeTable = (rawData) => {
  if (rawData === undefined) {
    return "";
  }

  const headers = parseHeaders(rawData);
  const data = parseData(headers, rawData);

  try {
    return new Table({ class: "size-table" })
      .setHeaders(headers)
      .setData(data)
      .render();
  } catch (e) {
    console.error("Fail to create Table");
    return undefined;
  }
};

module.exports = { getSizeTable };
