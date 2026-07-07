import { defineMethod } from "../types"
import {
  clubCodeField,
  seasonField,
  standingsTypeField,
} from "../params"

export const BATCH_A_METHODS = [
  defineMethod({
    resource: "seasons",
    method: "list",
    label: "list",
    description: "List every season for the current competition.",
    params: [],
    returnType: "Season[]",
    invoke: (client) => client.seasons.list(),
  }),
  defineMethod({
    resource: "seasons",
    method: "get",
    label: "get",
    description: "Fetch a single season by start year.",
    params: [seasonField()],
    returnType: "Season",
    invoke: (client, params) =>
      client.seasons.get(params as { season: number }),
  }),

  defineMethod({
    resource: "clubs",
    method: "list",
    label: "list",
    params: [seasonField()],
    returnType: "Club[]",
    invoke: (client, params) =>
      client.clubs.list(params as { season: number }),
  }),
  defineMethod({
    resource: "clubs",
    method: "get",
    label: "get",
    params: [seasonField(), clubCodeField()],
    returnType: "Club",
    invoke: (client, params) =>
      client.clubs.get(params as { season: number; clubCode: string }),
  }),
  defineMethod({
    resource: "clubs",
    method: "getRoster",
    label: "getRoster",
    params: [seasonField(), clubCodeField()],
    returnType: "ClubRosterMember[]",
    invoke: (client, params) =>
      client.clubs.getRoster(params as { season: number; clubCode: string }),
  }),
  defineMethod({
    resource: "clubs",
    method: "getLogo",
    label: "getLogo",
    params: [seasonField(), clubCodeField()],
    returnType: "string",
    invoke: (client, params) =>
      client.clubs.getLogo(params as { season: number; clubCode: string }),
  }),

  defineMethod({
    resource: "competitions",
    method: "list",
    label: "list",
    params: [],
    returnType: "CompetitionInfo[]",
    invoke: (client) => client.competitions.list(),
  }),
  defineMethod({
    resource: "competitions",
    method: "get",
    label: "get",
    params: [],
    returnType: "CompetitionInfo",
    invoke: (client) => client.competitions.get(),
  }),

  defineMethod({
    resource: "phases",
    method: "list",
    label: "list",
    params: [seasonField()],
    returnType: "Phase[]",
    invoke: (client, params) =>
      client.phases.list(params as { season: number }),
  }),
  defineMethod({
    resource: "phases",
    method: "get",
    label: "get",
    params: [
      seasonField(),
      {
        name: "phase",
        label: "Phase code",
        kind: "string",
        required: true,
        defaultValue: "RS",
      },
    ],
    returnType: "Phase",
    invoke: (client, params) =>
      client.phases.get(params as { season: number; phase: string }),
  }),

  defineMethod({
    resource: "rounds",
    method: "list",
    label: "list",
    params: [seasonField()],
    returnType: "Round[]",
    invoke: (client, params) =>
      client.rounds.list(params as { season: number }),
  }),
  defineMethod({
    resource: "rounds",
    method: "get",
    label: "get",
    params: [
      seasonField(),
      {
        name: "round",
        label: "Round",
        kind: "number",
        required: true,
        defaultValue: 1,
      },
    ],
    returnType: "Round",
    invoke: (client, params) =>
      client.rounds.get(params as { season: number; round: number }),
  }),

  defineMethod({
    resource: "standings",
    method: "getRound",
    label: "getRound",
    params: [
      seasonField(),
      {
        name: "round",
        label: "Round",
        kind: "number",
        required: true,
        defaultValue: 1,
      },
      standingsTypeField,
    ],
    returnType: "Standing[]",
    invoke: (client, params) => client.standings.getRound(params as never),
  }),
]
