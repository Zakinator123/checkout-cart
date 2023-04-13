import {SelectOption, SelectOptionValue} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import {Label, loadCSSFromString, SelectButtons} from "@airtable/blocks/ui";
import React from "react";

loadCSSFromString(`
.option-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 1rem;
}`);


const OptionSelector = ({
                            currentOption,
                            options,
                            setOption,
                            transactionIsProcessing
                        }: { currentOption: SelectOptionValue; setOption: any; options: SelectOption[], transactionIsProcessing: boolean }) =>
    <div className='option-selector'>
        <div>
            <Label>Transaction Type:</Label>
            <SelectButtons
                value={currentOption}
                onChange={(newValue) => setOption(newValue)}
                options={options}
                minWidth='175px'
                maxWidth={400}
                disabled={transactionIsProcessing}
            />
        </div>
    </div>;
export default OptionSelector;