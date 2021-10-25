import * as identity from '@iota/identity-wasm/web';
import cloneDeep from 'lodash/cloneDeep';
import Keychain from '~/lib/keychain';
import { SchemaNames } from '~/lib/identity/schemas';
import { parse } from '~/lib/helpers';
import { hasSetupAccount, dataVersion, credentials, defaultCredentials } from '~/lib/store';

const PERMANODE_URL = 'https://chrysalis-chronicle.iota.org/api/mainnet/';
/**
 * Personal identity object
 */
export type Identity = {
    did: string;
    key: { public: string; secret: string; type: string };
};

/**
 * Schema name (as key) with credentials (as value)
 */
export type SchemaNamesWithCredentials = {
    [key in SchemaNames]: any;
};

/**
 * (User) address credential data
 */
export type AddressData = {
    Language: string;
    Locale: string;
    UserAddress: {
        City: string;
        State: string;
        Country: string;
        Postcode: string;
        Street: string;
        House: string;
    };
};

/**
 * (User) personal credential data
 */
export type PersonalData = {
    Language: string;
    Locale: string;
    UserPersonalData: {
        UserName: {
            FirstName: string;
            LastName: string;
        };
        UserDOB: {
            Date: string;
        };
        Birthplace: string;
        Nationality: string;
        Country: string;
        Gender: string;
        IdentityCardNumber: string;
        PassportNumber: string;
    };
};

/**
 * Test result credential data
 */
export type TestResultData = {
    TestID: string;
    TestBy: string;
    TestTimestamp: string;
    TestKit: string;
    TestResult: string;
};

/**
 * Visa application credential data
 */
export type VisaApplicationData = {
    VisaApplicationNumber: string;
    VisaCountry: string;
};

/**
 * (User) contact details
 */
export type ContactDetails = {
    Language: string;
    Locale: string;
    UserContacts: {
        Email: string;
        Phone: string;
        Cell: string;
    };
};

/**
 * Company credential data
 */
export type CompanyData = {
    CompanyName: string;
    CompanyAddress: string;
    CompanyType: string;
    CompanyBusiness: string;
    CompanyNumber: string;
    CompanyOwner: string;
    CompanyStatus: string;
    CompanyCreationDate: string;
};

/**
 * Bank credential data
 */
export type BankData = {
    BankName: string;
    AccountType: string;
    AccountNumber: string;
    AccountIBAN: string;
};

/**
 * Insurance credential data
 */
export type InsuranceData = {
    Name: string;
    Address: string;
    AccountNumber: string;
    InsuranceType: string;
    StartDate: string;
    EndDate: string;
};

/**
 * Commitment credential information
 */
type Commitment = {
    CommitmentId: string;
    CommitmentTitle: string;
    CommitmentPercentage: number;
    CommitmentSupport: string;
    CommitmentWalletPercentage: number;
};

/**
 * Future Commitment data
 */
export type FutureCommitmentData = {
    Commitments: Commitment[];
};

/**
 * Present Commitment data
 */
export type PresentCommitmentData = {
    Commitments: Commitment[];
};

/**
 * Creates new identity
 *
 * @method createIdentity
 *
 * @returns {Promise<Identity>}
 */
export const createIdentity = async (): Promise<Identity> => {
    await identity.init();

    const mainNet = identity.Network.mainnet();

    const { doc, key } = new identity.Document(identity.KeyType.Ed25519);

    doc.sign(key);

    const config = identity.Config.fromNetwork(mainNet);
    config.setPermanode(PERMANODE_URL);

    const client = identity.Client.fromConfig(config);

    await client.publishDocument(doc.toJSON());

    return { did: doc.toJSON().id, key: key.toJSON() };
};

/**
 * Stores identity in keychain
 *
 * @method storeIdentity
 *
 * @param {string} identifier
 * @param {Identity} identity
 *
 * @returns {Promise}
 */
export const storeIdentity = (identifier: string, ident: Identity): Promise<{ value: boolean }> => {
    return Keychain.set(identifier, JSON.stringify(ident));
};

/**
 * Clears identity and all credentials
 *
 * @method clearIdentity
 *
 * @returns {Promise}
 */
export const clearIdentity = (): Promise<boolean> => {
    hasSetupAccount.set(false);
    dataVersion.set(undefined);
    credentials.set(cloneDeep(defaultCredentials));
    return Keychain.clear();
};

/**
 * Stores identity in keychain
 *
 * @method storeIdentity
 *
 * @param {string} identifier
 * @param {Identity} identity
 *
 * @returns {Promise}
 */
export const retrieveIdentity = (identifier = 'did'): Promise<Identity> => {
    return Keychain.get(identifier)
        .then((data) => parse(data.value))
        .catch(() => null);
};

/**
 * Creates credential
 *
 * @method createCredential
 *
 * @param {Identity} issuer
 * @param {SchemaNames} schemaName
 * @param {any} data
 * @param {string} revocationAddress
 *
 * @returns {Promise<any>}
 */
export const createCredential = async (issuer: Identity, schemaName: SchemaNames, data: any): Promise<any> => {
    await identity.init();

    const mainNet = identity.Network.mainnet();

    const config = identity.Config.fromNetwork(mainNet);
    config.setPermanode(PERMANODE_URL);

    const client = identity.Client.fromConfig(config);

    const resolvedIssuer = identity.Document.fromJSON((await client.resolve(issuer.did)).document);

    const credentialSubject = data;

    const unsignedVc = identity.VerifiableCredential.extend({
        id: 'http://example.edu/credentials/3732',
        type: schemaName,
        issuer: issuer.did,
        credentialSubject
    });

    const signedVc = resolvedIssuer.signCredential(unsignedVc, {
        method: `${issuer.did}#key`,
        public: issuer.key.public,
        secret: issuer.key.secret
    });

    await client.checkCredential(signedVc.toString());

    return signedVc.toJSON();
};

/**
 * Stores credential in keychain
 *
 * @method storeCredential
 *
 * @param {string} credentialId
 * @param {any} credential
 *
 * @returns {Promise<{ value: boolean }>}
 */
export const storeCredential = (credentialId: string, credential: any): Promise<{ value: boolean }> => {
    return Keychain.set(credentialId, JSON.stringify(credential));
};

/**
 * Retrieves credential from keychain
 *
 * @method retrieveCredential
 *
 * @param {string} credentialId
 *
 * @returns {Promise<any>}
 */
export const retrieveCredential = (credentialId: string): Promise<any> => {
    return Keychain.get(credentialId)
        .then((data) => parse(data.value))
        .catch(() => null);
};

/**
 * Creates verifiable presentations for provided schema names
 *
 * @method createVerifiablePresentations
 *
 * @param {Identity} issuer
 * @param {SchemaNamesWithCredentials} schemaNamesWithCredentials
 *
 * @returns {Promise<VerifiablePresentationDataModel>}
 */
export const createVerifiablePresentations = async (
    issuer: Identity,
    schemaNamesWithCredentials: SchemaNamesWithCredentials
): Promise<any> => {
    await identity.init();
    const mainNet = identity.Network.mainnet();

    const config = identity.Config.fromNetwork(mainNet);
    config.setPermanode(PERMANODE_URL);

    const client = identity.Client.fromConfig(config);

    const resolvedIssuer = identity.Document.fromJSON((await client.resolve(issuer.did)).document);

    const unsignedVp = new identity.VerifiablePresentation(resolvedIssuer, Object.values(schemaNamesWithCredentials));

    const signedVp = resolvedIssuer.signPresentation(unsignedVp, {
        method: '#key',
        secret: issuer.key.secret
    });

    await client.checkPresentation(signedVp.toString());
    return signedVp.toJSON();
};
