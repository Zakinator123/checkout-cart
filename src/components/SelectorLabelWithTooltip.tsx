import React from "react";
import {Icon, Tooltip} from "@airtable/blocks/ui";

export const SelectorLabelWithTooltip = ({
                                             selectorLabel,
                                             selectorLabelTooltip
                                         }: { selectorLabel: string, selectorLabelTooltip: string }) =>
    <>
        {selectorLabel}
        <Tooltip
            fitInWindowMode={Tooltip.fitInWindowModes.NONE}
            content={selectorLabelTooltip}
            placementX={Tooltip.placements.RIGHT}
            placementY={Tooltip.placements.CENTER}>
            <Icon name="info" size={12} marginLeft='0.5rem'/>
        </Tooltip>
    </>