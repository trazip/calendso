import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import React, { useState, useEffect } from "react";
import TimezoneSelect, { ITimezone } from "react-timezone-select";

import { WEBSITE_URL } from "@calcom/lib/constants";

import { trpc, inferQueryOutput } from "@lib/trpc";

import Avatar from "@components/ui/Avatar";
import { DatePicker } from "@components/ui/form/DatePicker";
import Select from "@components/ui/form/Select";

import TeamAvailabilityTimes from "./TeamAvailabilityTimes";

dayjs.extend(utc);

interface Props {
  team?: inferQueryOutput<"viewer.teams.get">;
  member?: inferQueryOutput<"viewer.teams.get">["members"][number];
}

export default function TeamAvailabilityModal(props: Props) {
  const utils = trpc.useContext();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTimeZone, setSelectedTimeZone] = useState<ITimezone>(
    localStorage.getItem("timeOption.preferredTimeZone") || dayjs.tz.guess()
  );
  const [frequency, setFrequency] = useState<15 | 30 | 60>(30);

  useEffect(() => {
    utils.invalidateQueries(["viewer.teams.getMemberAvailability"]);
  }, [utils, selectedTimeZone, selectedDate]);

  return (
    <div className="flex max-h-[500px] min-h-[500px] flex-row  space-x-8 rtl:space-x-reverse">
      <div className="min-w-64 w-64 space-y-5 p-5 pr-0">
        <div className="flex">
          <Avatar
            imageSrc={WEBSITE_URL + "/" + props.member?.username + "/avatar.png"}
            alt={props.member?.name || ""}
            className="h-14 w-14 rounded-full"
          />
          <div className="ml-3 inline-block pt-1">
            <span className="text-lg font-bold text-neutral-700">{props.member?.name}</span>
            <span className="-mt-1 block text-sm text-gray-400">{props.member?.email}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-600">Date</span>
          <DatePicker
            date={selectedDate.toDate()}
            onDatesChange={(newDate) => {
              setSelectedDate(dayjs(newDate));
            }}
          />
        </div>
        <div>
          <span className="font-bold text-gray-600">Timezone</span>
          <TimezoneSelect
            id="timeZone"
            value={selectedTimeZone}
            onChange={(timezone) => setSelectedTimeZone(timezone.value)}
            className="mt-1 block w-full rounded-sm border border-gray-300 shadow-sm sm:text-sm"
          />
        </div>
        <div>
          <span className="font-bold text-gray-600">Slot Length</span>
          <Select
            options={[
              { value: 15, label: "15 minutes" },
              { value: 30, label: "30 minutes" },
              { value: 60, label: "60 minutes" },
            ]}
            isSearchable={false}
            className="block w-full min-w-0 flex-1 rounded-sm border border-gray-300 sm:text-sm"
            value={{ value: frequency, label: `${frequency} minutes` }}
            onChange={(newFrequency) => setFrequency(newFrequency?.value ?? 30)}
          />
        </div>
      </div>
      {props.team && props.member && (
        <TeamAvailabilityTimes
          className="overflow-auto"
          teamId={props.team.id}
          memberId={props.member.id}
          frequency={frequency}
          selectedDate={selectedDate}
          selectedTimeZone={selectedTimeZone}
        />
      )}
    </div>
  );
}
