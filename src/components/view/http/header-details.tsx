import * as _ from 'lodash';
import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { styled } from '../../../styles';
import { RawHeaders } from '../../../types';

import { getHeaderDocs } from '../../../model/http/http-docs';
import { AccountStore } from '../../../model/account/account-store';

import { CollapsibleSection } from '../../common/collapsible-section';
import { DocsLink } from '../../common/docs-link';
import { BlankContentPlaceholder } from '../../common/text-content';
import {
    CollapsibleSectionSummary,
    CollapsibleSectionBody
} from '../../common/collapsible-section';
import { Pill } from '../../common/pill';

import { CookieHeaderDescription } from './set-cookie-header-description';
import { UserAgentHeaderDescription } from './user-agent-header-description';

const HeadersGrid = styled.section`
    display: grid;
    grid-template-columns: 20px fit-content(30%) 1fr;

    grid-gap: 5px 0;
    &:not(:last-child) {
        margin-bottom: 10px;
    }
`;

const HeaderKeyValueContainer = styled(CollapsibleSectionSummary)`
    word-break: break-all; /* Fallback for anybody without break-word */
    word-break: break-word;
    font-family: ${p => p.theme.monoFontFamily};
    line-height: 1.1;
`;

const LONG_HEADER_LIMIT = 200;

const HeaderKeyValue = (p: {
    headerKey: string,
    headerValue: string,

    // All injected by CollapsibleSection itself:
    children?: React.ReactNode,
    open?: boolean,
    withinGrid?: boolean
}) => {
    const longValue = p.headerValue.length > LONG_HEADER_LIMIT;

    return <HeaderKeyValueContainer open={p.open} withinGrid={p.withinGrid}>
        { p.children }
        <HeaderName>{ p.headerKey }: </HeaderName>
        {
            p.open || !longValue
            ? <span>{ p.headerValue }</span>
            : <LongHeaderValue>
                { p.headerValue.slice(0, LONG_HEADER_LIMIT - 10) }
                <LongHeaderMarker>...</LongHeaderMarker>
            </LongHeaderValue>
        }
    </HeaderKeyValueContainer>;
};

const LongHeaderValue = styled.span`
    position: relative;

    :after {
        content: '';
        background-image: linear-gradient(to bottom, transparent, transparent 75%, ${p => p.theme.mainBackground});
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
`;

const LongHeaderMarker = styled(Pill)`
    position: relative;
    z-index: 1;

    vertical-align: middle;
    padding: 2px 4px;
    font-size: 10px;
    margin-left: 4px;
`;

const HeaderName = styled.span`
    margin-right: 10px;
`;

const HeaderDescriptionContainer = styled(CollapsibleSectionBody)`
    line-height: 1.3;
`;

const HeaderDocsLink = styled(DocsLink)`
    display: block;
    margin-top: 10px;
`;

const PseudoHeadersHiddenMessage = styled.span`
    grid-column: 2 / -1;
    font-style: italic;
`;

const PseudoHeadersContent = styled(CollapsibleSectionBody)`
    line-height: 1.3;
`;

const getHeaderDescription = (
    name: string,
    value: string,
    requestUrl: URL,
    isPaidUser: boolean
) => {
    name = name.toLowerCase();

    if (isPaidUser) {
        if (name === 'set-cookie') {
            return <CookieHeaderDescription
                value={value}
                requestUrl={requestUrl}
            />;
        } else if (name === 'user-agent') {
            return <UserAgentHeaderDescription
                value={value}
            />;
        }
    }

    const headerDocs = getHeaderDocs(name)?.summary;

    return headerDocs && <p>
        { headerDocs }
    </p>
};

export const HeaderDetails = inject('accountStore')(observer((props: {
    httpVersion: 1 | 2;
    headers: RawHeaders,
    requestUrl: URL,
    accountStore?: AccountStore
}) => {
    const sortedHeaders = _.sortBy(props.headers, ([key]) => key.toLowerCase());

    if (sortedHeaders.length === 0) {
        return <BlankContentPlaceholder>(None)</BlankContentPlaceholder>
    }

    let [pseudoHeaders, normalHeaders] = _.partition(sortedHeaders, ([key]) =>
        props.httpVersion >= 2 && key.startsWith(':')
    );

    if (normalHeaders.length === 0) {
        normalHeaders = pseudoHeaders;
        pseudoHeaders = [];
    }

    return <HeadersGrid>
        {
            pseudoHeaders.length > 0 && <CollapsibleSection withinGrid={true}>
                <CollapsibleSectionSummary>
                    <PseudoHeadersHiddenMessage>
                        HTTP/{props.httpVersion} pseudo-headers
                    </PseudoHeadersHiddenMessage>
                </CollapsibleSectionSummary>

                <PseudoHeadersContent>
                    <PseudoHeaderDetails
                        headers={pseudoHeaders}
                    />
                </PseudoHeadersContent>
            </CollapsibleSection>
        }

        { _.flatMap(normalHeaders, ([key, value], i) => {
            const docs = getHeaderDocs(key);
            const description = getHeaderDescription(
                key,
                value,
                props.requestUrl,
                props.accountStore!.isPaidUser
            )

            return <CollapsibleSection withinGrid={true} key={`${key}-${i}`}>
                <HeaderKeyValue headerKey={key} headerValue={value} />

                { description && <HeaderDescriptionContainer>
                    { description }
                    { docs && <HeaderDocsLink href={docs.url}>
                        Find out more
                    </HeaderDocsLink> }
                </HeaderDescriptionContainer> }
            </CollapsibleSection>;
        }) }
    </HeadersGrid>;
}));

const PseudoHeaderDetails = observer((props: {
    headers: RawHeaders
}) => {
    return <HeadersGrid>
        { _.flatMap(props.headers, ([key, value], i) => {
            return <CollapsibleSection withinGrid={true} key={`${key}-${i}`}>
                <HeaderKeyValue headerKey={key} headerValue={value} />
            </CollapsibleSection>;
        }) }
    </HeadersGrid>;
});