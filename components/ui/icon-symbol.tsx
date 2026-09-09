import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";
type IconName = ComponentProps<typeof MaterialIcons>["name"];
const MAPPING: Record<string, IconName> = { "house.fill": "home", "book.fill": "menu-book", "checkmark.circle.fill": "check-circle", timer: "timer", "chart.bar.fill": "bar-chart", "plus.circle.fill": "add-circle", "sparkles": "auto-awesome", "calendar": "calendar-month", "arrow.clockwise": "sync", "person.crop.circle": "account-circle" };
export function IconSymbol({ name, size = 24, color, style }: { name: string; size?: number; color: string | OpaqueColorValue; style?: StyleProp<TextStyle>; weight?: string }) { return <MaterialIcons color={color} size={size} name={MAPPING[name] ?? "help-outline"} style={style} />; }
