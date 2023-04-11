import {TablesAndFieldsConfigurationErrors} from "./ConfigurationTypes";

export type ExtensionConfigurationUpdateResult = {
    errorsOccurred: true,
    errorMessage: string,
    tablesAndFieldsConfigurationErrors: TablesAndFieldsConfigurationErrors
} | { errorsOccurred: false }