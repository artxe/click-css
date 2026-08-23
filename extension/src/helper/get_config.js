import { workspace } from "vscode"
export const default_unit = "px"
export const shorthand_for_media_condition = new Map(
	workspace
		.getConfiguration()
		.get(
			"click-css.custom.shorthand_for_media_condition"
		)
)
export const shorthand_for_properties = new Map(
	workspace
		.getConfiguration()
		.get(
			"click-css.custom.shorthand_for_properties"
		)
)
export const shorthand_for_values = new Map(
	workspace
		.getConfiguration()
		.get(
			"click-css.custom.shorthand_for_values"
		)
)