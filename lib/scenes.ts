export type SceneId = 'lab' | 'field' | 'sunset';

export interface SceneTheme {
  id: SceneId;
  name: string;
  description: string;
  swatch: string;
  background: string;
  fog: string;
  floor: string;
  gridMinor: string;
  gridMajor: string;
  gridAccent: string;
  ambient: string;
  ambientIntensity: number;
  hemisphereSky: string;
  hemisphereGround: string;
  hemisphereIntensity: number;
  sun: string;
  sunIntensity: number;
  point: string;
  pointIntensity: number;
}

export const SCENES: Record<SceneId, SceneTheme> = {
  lab: {
    id: 'lab',
    name: '风洞实验室',
    description: '明亮网格与蓝色轴线，适合观察飞行轨迹。',
    swatch: '#2563EB',
    background: '#EAF1F8',
    fog: '#EAF1F8',
    floor: '#F8FAFC',
    gridMinor: '#E2E8F0',
    gridMajor: '#CBD5E1',
    gridAccent: '#2563EB',
    ambient: '#FFFFFF',
    ambientIntensity: 0.85,
    hemisphereSky: '#F8FAFC',
    hemisphereGround: '#CBD5E1',
    hemisphereIntensity: 1.05,
    sun: '#FFFFFF',
    sunIntensity: 1.7,
    point: '#2563EB',
    pointIntensity: 0.45,
  },
  field: {
    id: 'field',
    name: '操场晴空',
    description: '柔和草地色地面，适合日常手抛纸飞机。',
    swatch: '#16A34A',
    background: '#DFF3FF',
    fog: '#DFF3FF',
    floor: '#E8F7DF',
    gridMinor: '#CDE8BF',
    gridMajor: '#9FD18A',
    gridAccent: '#22C55E',
    ambient: '#FFFFFF',
    ambientIntensity: 0.95,
    hemisphereSky: '#E0F2FE',
    hemisphereGround: '#BBF7D0',
    hemisphereIntensity: 1.15,
    sun: '#FFF7D6',
    sunIntensity: 1.9,
    point: '#38BDF8',
    pointIntensity: 0.35,
  },
  sunset: {
    id: 'sunset',
    name: '黄昏跑道',
    description: '暖色低光与深色地面，突出纸飞机剪影。',
    swatch: '#F59E0B',
    background: '#FDE7C7',
    fog: '#FDE7C7',
    floor: '#E9D5B8',
    gridMinor: '#D7B98C',
    gridMajor: '#B78B5E',
    gridAccent: '#EA580C',
    ambient: '#FFE8C2',
    ambientIntensity: 0.72,
    hemisphereSky: '#FED7AA',
    hemisphereGround: '#7C4A24',
    hemisphereIntensity: 0.95,
    sun: '#FDBA74',
    sunIntensity: 2.1,
    point: '#F97316',
    pointIntensity: 0.55,
  },
};

export const SCENE_LIST = Object.values(SCENES);
