import {
    openZuzaluMembershipPopup,
    usePassportPopupMessages,
} from "@pcd/passport-interface";
import { generateMessageHash } from "@pcd/semaphore-signature-pcd";
import { sha256 } from "js-sha256";
import stableStringify from "json-stable-stringify";
import { useCallback, useEffect, useRef, useState } from "react";
import { doVote } from "./api";
import { UserType, VoteRequest, VoteSignal } from "./types";
import { PASSPORT_URL, SEMAPHORE_GROUP_URL } from "./util";
import { PollDefinition, ZupollError } from "./types";

enum VoteFormState {
    DEFAULT,
    AWAITING_PCDSTR,
    RECEIVED_PCDSTR,
}

export function usePollVote(
    poll: PollDefinition,
    onError: (err: ZupollError) => void,
    onVoted: (id: string) => void,
    setServerLoading: (loading: boolean) => void,
): ((voteIdx: number) => Promise<void>) | null {
    const votingState = useRef<VoteFormState>(VoteFormState.DEFAULT);
    const [option, setOption] = useState<string>("-1");
    const [pcdStr, _passportPendingPCDStr] = usePassportPopupMessages();

    useEffect(() => {
        if (votingState.current === VoteFormState.AWAITING_PCDSTR) {
            votingState.current = VoteFormState.RECEIVED_PCDSTR;
        }
    }, [pcdStr]);

    useEffect(() => {
        if (votingState.current !== VoteFormState.RECEIVED_PCDSTR) return;
        if (option === "-1" || getVoted().includes(poll.id)) return;

        votingState.current = VoteFormState.DEFAULT;

        const parsedPcd = JSON.parse(decodeURIComponent(pcdStr));
        const request: VoteRequest = {
            pollId: poll.id,
            voterType: UserType.ANON,
            voterSemaphoreGroupUrl: SEMAPHORE_GROUP_URL,
            voteIdx: parseInt(option),
            proof: parsedPcd.pcd,
        };

        async function doRequest() {
            setServerLoading(true);
            const res = await doVote(request);
            setServerLoading(false);

            if (!res.ok) {
                const resErr = await res.text();
                console.error("error posting vote to the server: ", resErr);
                const err = {
                    title: "Voting failed",
                    message: `Server Error: ${resErr}`,
                } as ZupollError;
                onError(err);
                return;
            }
            const newVote = await res.json();

            const newVoted = getVoted();
            newVoted.push(poll.id);
            setVoted(newVoted);
            setOption("-1");
            onVoted(newVote["id"]);
        }

        doRequest();
    }, [poll, pcdStr, option, onError, onVoted, setServerLoading]);

    const handleVote = useCallback(
        async (voteIdx: number) => {
            setOption(voteIdx.toString());
            votingState.current = VoteFormState.AWAITING_PCDSTR;

            if (!(voteIdx >= 0 && voteIdx < poll.options.length)) {
                const err = {
                    title: "Voting failed",
                    message: "Invalid option selected.",
                } as ZupollError;
                onError(err);
                return;
            }

            const signal: VoteSignal = {
                pollId: poll.id,
                voteIdx: voteIdx,
            };
            const signalHash = sha256(stableStringify(signal));
            const sigHashEnc = generateMessageHash(signalHash).toString();
            const externalNullifier = generateMessageHash(poll.id).toString();

            openZuzaluMembershipPopup(
                PASSPORT_URL,
                window.location.origin + "/popup",
                SEMAPHORE_GROUP_URL,
                "zupoll",
                sigHashEnc,
                externalNullifier
            );
        },
        [onError, poll.id, poll.options.length]
    );

    if (votedOn(poll.id)) return null;

    return handleVote;
}

export function votedOn(id: string): boolean {
    return getVoted().includes(id);
}

export function getVoted(): Array<string> {
    const voted: Array<string> = JSON.parse(
        window.localStorage.getItem("voted") || "[]"
    );
    return voted;
}

export function setVoted(voted: Array<string>) {
    window.localStorage.setItem("voted", JSON.stringify(voted));
}
