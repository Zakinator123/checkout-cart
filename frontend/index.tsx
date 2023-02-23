import React from "react";
import CheckoutWithCart from "./CheckoutWithCart";
import { initializeBlock } from '@airtable/blocks/ui';

initializeBlock(() => <CheckoutWithCart />);
