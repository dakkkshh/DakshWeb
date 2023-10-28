import React from 'react'
import styled from 'styled-components'
import { achievements } from '../../data/constants'

const Container = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
position: relative;
z-index: 1;
align-items: center;
@media (max-width: 960px) {
    padding: 0px;
}
`
const Wrapper = styled.div`
position: relative;
display: flex;
justify-content: space-between;
align-items: center;
flex-direction: column;
width: 100%;
max-width: 1350px;
padding: 0px 0px 80px 0px;
gap: 12px;
@media (max-width: 960px) {
    flex-direction: column;
}
`

const Title = styled.div`
font-size: 42px;
text-align: center;
font-weight: 600;
margin-top: 20px;
  color: ${({ theme }) => theme.text_primary};
  @media (max-width: 768px) {
      margin-top: 12px;
      font-size: 32px;
  }
`;

const AchievementWrapper = styled.div`
color: ${({ theme }) => theme.text_primary};
font-size: 20px;
width: 100%;
background: ${({ theme }) => theme.card};
border: 0.1px solid #854CE6;
box-shadow: rgba(23, 92, 230, 0.15) 0px 4px 24px;
border-radius: 16px;
padding: 18px 36px;
`;

export default function Achievements(){
    return (
        <Container id='achievements'>
            <Wrapper>
                <Title>Achievements</Title>
                {
                    achievements.map((achievement) => (
                        <AchievementWrapper
                            key={achievement.id}
                        >
                            {achievement.content}
                        </AchievementWrapper>
                    ))
                }
            </Wrapper>
        </Container>
    )   
}