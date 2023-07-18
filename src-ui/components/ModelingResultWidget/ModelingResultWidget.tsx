import React, { FC } from 'react';
import { EvacuationModelingResult } from '../../types/ModelingResult';
import cn from 'classnames';

interface ModelingResultWidgetProps {
	className?: string;
	modelingResult: EvacuationModelingResult;
}

const ModelingResultWidget: FC<ModelingResultWidgetProps> = ({
	className,
	modelingResult
}) => {
	return (
		<section className={cn(className)}>
			<p>
				Кол-во человек в здании:{' '}
				{modelingResult.number_of_people_inside_building.toFixed(2)}
			</p>
			<p>
				Кол-во человек в безопасной зоне:{' '}
				{modelingResult.number_of_evacuated_people.toFixed(2)}
			</p>
			<p>Время эвакуации: {(modelingResult.time_in_seconds / 60).toFixed(2)} мин.</p>
		</section>
	);
};

export default ModelingResultWidget;
