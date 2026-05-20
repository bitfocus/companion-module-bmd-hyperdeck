// __mocks__/MockInstanceBase.ts

export class MockInstanceBase<TConfig = any> {
	log: jest.Mock = jest.fn();
	updateStatus: jest.Mock = jest.fn();
	setActionDefinitions: jest.Mock = jest.fn();
	setFeedbackDefinitions: jest.Mock = jest.fn();
	setPresetDefinitions: jest.Mock = jest.fn();
	setVariableValues: jest.Mock = jest.fn();
	checkFeedbacks: jest.Mock = jest.fn();
	saveConfig: jest.Mock = jest.fn();
	config: TConfig = {} as TConfig;
	
	constructor(public internal: any) {}
}