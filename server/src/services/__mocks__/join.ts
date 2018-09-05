export const Join: any = jest.genMockFromModule('../join');

Join.searchNickname = async function searchNickname(nickname: string): Promise<string | undefined> {
  const isNicknameDefinedInDatabase = nickname === 'mockDuplicatedNickname';

  // searchNickname returns an empty string if the given nickname doesn't collide with existing values.
  return isNicknameDefinedInDatabase ? nickname : '';
};

export default Join;
