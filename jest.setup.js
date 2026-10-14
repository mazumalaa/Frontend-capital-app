const {jest} = require('@jest/globals');

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-keychain", () => ({
  getGenericPassword: jest.fn(async () => false),
  setGenericPassword: jest.fn(async () => true),
  resetGenericPassword: jest.fn(async () => true),
}));

jest.mock("@react-native-vector-icons/feather", () => "FeatherIcon");
jest.mock("@react-native-vector-icons/fontawesome6", () => "FontAwesomeIcon");
