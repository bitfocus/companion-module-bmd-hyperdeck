/// <reference types="jest" />
import type { DropdownChoice } from '@companion-module/base'
import type { HyperdeckConfig } from './config'
import type { Commands } from 'hyperdeck-connection'
import type { ModelInfo } from './models'
import type { SimpleClipInfo } from './util'
import {
	ClipDropdownChoice,
	InstanceBaseExt,
	TransportInfoStateExt,
	IpAndPort,
} from './types'

// These type tests verify that our interfaces are correctly defined
// Since these are just interfaces, we can validate the types statically

// Verify ClipDropdownChoice extends DropdownChoice correctly
const testClipDropdownChoice: ClipDropdownChoice = {
	id: 'some-id',   // This should be compatible with DropdownChoice's id (either string or number)
	label: 'Some Label', // This should be compatible with DropdownChoice's label
	clipId: 123, // This is the additional property for ClipDropdownChoice
};

// Assign it as a DropdownChoice to verify compatibility
const asDropdownChoice: DropdownChoice = testClipDropdownChoice;

// Since TransportInfoStateExt extends Commands.TransportInfoCommandResponse, we'll test it by using type assertion
type ExtendedTransportInfo = {
	clipName: string | null;
} & Commands.TransportInfoCommandResponse;

const testTransportInfoStateExt: TransportInfoStateExt = {} as ExtendedTransportInfo;

// Verify IpAndPort structure
const testIpAndPort: IpAndPort = {
	ip: '192.168.1.1',
	port: 8080,
};


// Test that all InstanceBaseExt properties and methods have the correct types
const testInstanceExt = {} as InstanceBaseExt;

// Use variables to avoid "declared but not used" errors
const usedAsDropdownChoice = asDropdownChoice;
const usedTestTransport = testTransportInfoStateExt;
const usedIpAndPort = testIpAndPort;

// Test some values to make sure they are used
const clipChoiceId: string | number = testClipDropdownChoice.id;
const clipChoiceLabel: string = testClipDropdownChoice.label;
const clipChoiceClipId: number = testClipDropdownChoice.clipId;

const transportClipName: string | null = usedTestTransport.clipName;

const ipValue: string = usedIpAndPort.ip;
const portValue: number | undefined = usedIpAndPort.port;

// Test that all InstanceBaseExt properties and methods have the correct types
// Property types
const transportInfoType: TransportInfoStateExt = testInstanceExt.transportInfo;
const deckConfigType: Commands.ConfigurationCommandResponse = testInstanceExt.deckConfig;
const slotInfoType: Commands.SlotInfoCommandResponse[] = testInstanceExt.slotInfo;
const protocolVersionType: number = testInstanceExt.protocolVersion;
const modelType: ModelInfo = testInstanceExt.model;
const configType: HyperdeckConfig = testInstanceExt.config;
const remoteInfoType: Commands.RemoteInfoCommandResponse | null = testInstanceExt.remoteInfo;
const formatTokenType: string | null = testInstanceExt.formatToken;
const formatTokenTimeoutType: NodeJS.Timeout | null = testInstanceExt.formatTokenTimeout;
const simpleClipsListType: SimpleClipInfo[] = testInstanceExt.simpleClipsList;
const fullClipsListType: Commands.ClipInfo[] = testInstanceExt.fullClipsList;

// Method types
const updateClipsType: (doFullInit?: boolean) => Promise<void> = testInstanceExt.updateClips;
const sendCommandType: <TResponse>(cmd: Commands.AbstractCommand<TResponse>) => Promise<TResponse> = testInstanceExt.sendCommand;
const refreshTransportInfoType: () => Promise<void> = testInstanceExt.refreshTransportInfo;

// Use all the variables to prevent unused variable errors
const usedValues = {
	usedAsDropdownChoice,
	usedTestTransport,
	usedIpAndPort,
	clipChoiceId,
	clipChoiceLabel,
	clipChoiceClipId,
	transportClipName,
	ipValue,
	portValue,
	transportInfoType,
	deckConfigType,
	slotInfoType,
	protocolVersionType,
	modelType,
	configType,
	remoteInfoType,
	formatTokenType,
	formatTokenTimeoutType,
	simpleClipsListType,
	fullClipsListType,
	updateClipsType,
	sendCommandType,
	refreshTransportInfoType,
};

// Verify that all assignments compile correctly without errors
console.log('Type tests completed successfully:', Object.keys(usedValues).length, 'tests validated');

// Add Jest test to satisfy Jest's requirement for at least one test
test('type definitions are valid', () => {
	expect(Object.keys(usedValues).length).toBeGreaterThan(0);
});