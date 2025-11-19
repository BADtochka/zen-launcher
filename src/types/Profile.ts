export type ParsedProfile = Record<string, {
  Name: string;
  Path: string;
  IsRelative: string;
}>;

export type Profile = {
  name: string;
  path: string;
  priority: number;
};
