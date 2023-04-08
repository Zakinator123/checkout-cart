import React from "react";
import {Toaster} from "react-hot-toast";

export const Toast = ({top}: {top: string}) => <Toaster
    position="bottom-center"
    reverseOrder={false}
    containerStyle={{
        position: 'relative',
        inset: `${top} 0 0 0`,
        margin: '1rem'
    }}
    gutter={8}
    toastOptions={{
        // Define default options
        duration: 4000,
        style: {
            maxWidth: 'max-content',
            minWidth: '250px',
            background: '#363636',
            color: '#fff',
            position: 'relative',
        },

        // Default options for specific types
        success: {
            duration: 2000,
            style: {
                minWidth: 'fit-content',
                background: 'green'
            },
        }
    }}
/>