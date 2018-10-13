import * as React from 'react';
import * as _ from 'lodash';
import { styled, FontAwesomeIcon } from '../styles'

export const EmptyState = styled((props: React.HTMLAttributes<HTMLDivElement> & {
    className?: string,
    message: string,
    icon: string[],
    spin?: boolean
}) => (
    <div {..._.omit(props, ['message', 'icon', 'spin'])}>
        <FontAwesomeIcon icon={props.icon} spin={props.spin} />
        <br/>
        { props.message }
    </div>
))`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    color: ${props => props.theme.containerWatermark};
    font-size: 40px;
    text-align: center;

    box-sizing: border-box;
    padding: 40px;
    height: 100%;
    width: 100%;

    > svg {
        font-size: 150px;
    }
`;